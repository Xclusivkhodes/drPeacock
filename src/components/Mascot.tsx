import { Image } from "react-native";

import { MascotImages, type MascotPose } from "@/constants/images";

interface MascotProps {
  pose: MascotPose;
  size?: number;
}

export function Mascot({ pose, size = 96 }: MascotProps) {
  return (
    <Image source={MascotImages[pose]} style={{ width: size, height: size }} resizeMode="contain" />
  );
}
