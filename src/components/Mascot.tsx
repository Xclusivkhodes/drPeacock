import { Image } from "react-native";

import { MascotImages, type MascotPose } from "@/constants/images";

interface MascotProps {
  pose: MascotPose;
  size?: number;
  width?: number;
  height?: number;
}

export function Mascot({ pose, size = 96, width, height }: MascotProps) {
  return (
    <Image
      source={MascotImages[pose]}
      style={{ width: width ?? size, height: height ?? size }}
      resizeMode="contain"
    />
  );
}
