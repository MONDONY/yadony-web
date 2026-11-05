#!/usr/bin/env bash
# Compresse les 6 vidéos de tutoriel (FR + EN) et extrait leurs affiches vers
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
  "track|yadony_demo_13_suivre_un_colis.mp4|yadony_demo_en_13_track_a_parcel.mp4|28|60"
  "payments|yadony_demo_18_moyens_de_paiement.mp4|yadony_demo_en_18_payment_methods.mp4|12|12"
  "alerts|yadony_demo_03_alertes_de_trajet.mp4|yadony_demo_en_03_route_alerts.mp4|14|14"
  "poster|yadony_demo_09_mon_affiche.mp4|yadony_demo_en_09_my_poster.mp4|30|30"
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
