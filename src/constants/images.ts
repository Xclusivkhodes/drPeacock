export const MascotImages = {
  caring: require("@/assets/images/mascot/caring.png"),
  celebrating: require("@/assets/images/mascot/celebrating.png"),
  checking: require("@/assets/images/mascot/checking.png"),
  confident: require("@/assets/images/mascot/confident.png"),
  explaining: require("@/assets/images/mascot/explaining.png"),
  happy: require("@/assets/images/mascot/happy.png"),
  hello: require("@/assets/images/mascot/hello.png"),
  medication: require("@/assets/images/mascot/medication.png"),
  reminder: require("@/assets/images/mascot/reminder.png"),
  shield: require("@/assets/images/mascot/shield.png"),
  surprised: require("@/assets/images/mascot/surprised.png"),
  thinking: require("@/assets/images/mascot/thinking.png"),
  tip: require("@/assets/images/mascot/tip.png"),
  wink: require("@/assets/images/mascot/wink.png"),
} as const;

export type MascotPose = keyof typeof MascotImages;

export const Images = {
  mascot: MascotImages,
} as const;
