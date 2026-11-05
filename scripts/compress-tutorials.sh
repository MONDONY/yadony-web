#!/usr/bin/env bash
# Compresse les vidéos de tutoriel (FR + EN) et extrait leurs affiches vers
# public/video/tutos/. Relançable : les fichiers existants sont réécrits.
#
# Usage : scripts/compress-tutorials.sh [dossier_FR] [dossier_EN]
#   ou    TUTOS_SRC_FR=... TUTOS_SRC_EN=... scripts/compress-tutorials.sh
# Par défaut, les sources sont cherchées dans
#   $DONY_ROOT/video/remotion-studio/sorties/{demos,demos_en}
# où DONY_ROOT vaut, à défaut, le dossier qui contient yadony-web-worktrees
# (ou yadony-web) : deux niveaux au-dessus de ce dépôt s'il est un worktree.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DONY_ROOT="${DONY_ROOT:-$(cd "$ROOT/../.." && pwd)}"
SRC_FR="${1:-${TUTOS_SRC_FR:-$DONY_ROOT/video/remotion-studio/sorties/demos}}"
SRC_EN="${2:-${TUTOS_SRC_EN:-$DONY_ROOT/video/remotion-studio/sorties/demos_en}}"
OUT="$ROOT/public/video/tutos"

MAX_BYTES=$((20 * 1024 * 1024)) # Cloudflare Pages : 25 Mo par fichier, marge de 5 Mo
CRF_START=28
CRF_MAX=38
POSTER_WIDTH=540

command -v ffmpeg >/dev/null || { echo "ffmpeg introuvable" >&2; exit 1; }
[ -d "$SRC_FR" ] || { echo "Dossier FR introuvable : $SRC_FR" >&2; exit 1; }
[ -d "$SRC_EN" ] || { echo "Dossier EN introuvable : $SRC_EN" >&2; exit 1; }
mkdir -p "$OUT"

# id | source FR | source EN | instant affiche FR (s) | instant affiche EN (s)
# (la version EN dure parfois plus longtemps : instants EN choisis sur image nette,
# ni caméra noire ni fondu)
TUTORIALS=(
  "search|yadony_demo_01_rechercher_un_voyageur.mp4|yadony_demo_en_01_find_a_traveler.mp4|14|20"
  "nearby|yadony_demo_02_voyageurs_pres_de_moi.mp4|yadony_demo_en_02_travelers_near_me.mp4|43|44"
  "alerts|yadony_demo_03_alertes_de_trajet.mp4|yadony_demo_en_03_route_alerts.mp4|14|14"
  "saved|yadony_demo_04_favoris.mp4|yadony_demo_en_04_saved_trips.mp4|28|20"
  "templates|yadony_demo_05_modeles_de_trajet.mp4|yadony_demo_en_05_trip_templates.mp4|100|112"
  "recurring|yadony_demo_06_trajet_recurrent.mp4|yadony_demo_en_06_recurring_trip.mp4|35|36"
  "ai|yadony_demo_07_creer_avec_l_ia.mp4|yadony_demo_en_07_create_with_ai.mp4|61|35"
  "itemprices|yadony_demo_08_prix_par_article.mp4|yadony_demo_en_08_prices_per_item.mp4|39|46"
  "poster|yadony_demo_09_mon_affiche.mp4|yadony_demo_en_09_my_poster.mp4|30|30"
  "request|yadony_demo_10_publier_une_demande_d_envoi.mp4|yadony_demo_en_10_post_a_shipping_request.mp4|106|96"
  "recipients|yadony_demo_11_mes_destinataires.mp4|yadony_demo_en_11_my_recipients.mp4|17|13"
  "receiving|yadony_demo_12_mes_receptions.mp4|yadony_demo_en_12_receiving.mp4|12|13"
  "track|yadony_demo_13_suivre_un_colis.mp4|yadony_demo_en_13_track_a_parcel.mp4|28|60"
  "messages|yadony_demo_14_messagerie.mp4|yadony_demo_en_14_messages.mp4|12|11"
  "call|yadony_demo_15_appel_yadony.mp4|yadony_demo_en_15_yadony_call.mp4|17|18"
  "assistant|yadony_demo_16_l_assistant.mp4|yadony_demo_en_16_the_assistant.mp4|28|15"
  "money|yadony_demo_17_mon_argent.mp4|yadony_demo_en_17_my_money.mp4|10|11"
  "payments|yadony_demo_18_moyens_de_paiement.mp4|yadony_demo_en_18_payment_methods.mp4|12|12"
  "invite|yadony_demo_19_parrainage.mp4|yadony_demo_en_19_referrals.mp4|16|16"
  "profile|yadony_demo_20_profil_et_avis.mp4|yadony_demo_en_20_profile_and_reviews.mp4|13|15"
  "gppro|yadony_demo_21_gp_pro.mp4|yadony_demo_en_21_gp_pro.mp4|13|21"
  "security|yadony_demo_22_securite_du_compte.mp4|yadony_demo_en_22_account_security.mp4|17|18"
  "flights|yadony_demo_24_billets_d_avion.mp4|yadony_demo_en_24_flight_tickets.mp4|12|16"
)

file_size() { wc -c < "$1" | tr -d ' '; }

encode() { # source destination
  local src="$1" dest="$2" crf="$CRF_START" tmp="$2.tmp.mp4"
  [ -f "$src" ] || { echo "Source absente : $src" >&2; exit 1; }
  while :; do
    ffmpeg -y -loglevel error -i "$src" -vf scale=720:-2 \
      -c:v libx264 -crf "$crf" -preset slow \
      -c:a aac -b:a 96k -movflags +faststart "$tmp"
    if [ "$(file_size "$tmp")" -lt "$MAX_BYTES" ]; then break; fi
    crf=$((crf + 2))
    if [ "$crf" -gt "$CRF_MAX" ]; then
      rm -f "$tmp"
      echo "Impossible de passer sous 20 Mo : $src" >&2
      exit 1
    fi
    echo "  > $(basename "$dest") trop lourd, nouvel essai en crf $crf"
  done
  mv "$tmp" "$dest"
  echo "OK $(basename "$dest") crf=$crf $(file_size "$dest") octets"
}

poster() { # source destination instant
  ffmpeg -y -loglevel error -ss "$3" -i "$1" -frames:v 1 \
    -vf "scale=$POSTER_WIDTH:-2" -q:v 4 "$2"
}

for entry in "${TUTORIALS[@]}"; do
  IFS='|' read -r id fr en at_fr at_en <<<"$entry"
  encode "$SRC_FR/$fr" "$OUT/$id.mp4"
  poster "$SRC_FR/$fr" "$OUT/$id-poster.jpg" "$at_fr"
  encode "$SRC_EN/$en" "$OUT/$id-en.mp4"
  poster "$SRC_EN/$en" "$OUT/$id-en-poster.jpg" "$at_en"
done

if [ -n "$(find "$OUT" -name '*.mp4' -size +20M)" ]; then
  echo "Un fichier dépasse 20 Mo" >&2
  exit 1
fi
echo "Terminé : $(find "$OUT" -type f | wc -l | tr -d ' ') fichiers dans $OUT"
