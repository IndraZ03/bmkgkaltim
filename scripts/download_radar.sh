#!/bin/bash
# Script to download radar images from local VPN and save to public directory
TARGET_DIR="/var/www/html/bmkgkaltim/public/radar"
BASE_URL="http://172.19.1.142/IMAGE"

# Make sure directory exists
mkdir -p "$TARGET_DIR"

download_image() {
  local url=$1
  local filename=$2
  local temp_file="/tmp/${filename}.tmp"
  
  wget -q -O "$temp_file" "$url" --timeout=15
  if [ $? -eq 0 ] && [ -s "$temp_file" ]; then
    mv "$temp_file" "$TARGET_DIR/$filename"
  else
    rm -f "$temp_file"
  fi
}

download_image "$BASE_URL/CMAX_Balikpapan.png" "CMAX_Balikpapan.png"
download_image "$BASE_URL/CMAX-HWIND_Balikpapan.png" "CMAX-HWIND_Balikpapan.png"
download_image "$BASE_URL/PAC06H_Balikpapan.png" "PAC06H_Balikpapan.png"
download_image "$BASE_URL/PAC24H_Balikpapan.png" "PAC24H_Balikpapan.png"

echo "Radar images updated at $(date)" >> /var/log/download_radar.log
