
/*
 * Edit this file to change the app title, intro/completion messages, and cards.
 * duration is configured in the app UI; defaultDuration is in seconds.
 */
window.TIMED_CARDS_CONFIG = {
  title: "Timed Cards",
  defaultDuration: 60,

  startCard: {
    eyebrow: "READY WHEN YOU ARE",
    counter: "Introduction",
    icon: "✦",
    title: "Ready to begin?",
    text: "Press below to start the sequence...",
    buttonText: "Start session"
  },

  cards: [
    {
      id: "step1",
      title: "Lymphatic Hops",
      text: "Gentle, rhythmic small hops to wake up circulation and the lymphatic system."
    },
        {
      id: "step2",
      title: "Body Waves",
      text: "Slow, full - body undulations from your feet up through your torso to free up the spine."
    },
        {
      id: "step3",
      title: "Trunk Twists",
      text: "Controlled rotational twists through the waist to release lower - back tightness."
    },
        {
      id: "step4",
      title: "Arm Swings",
      text: "Relaxed, rhythmic swings of the arms to open up the chest and shoulders."
    },
        {
      id: "step5",
      title: "Dead Arms",
      text: "Weighted, loose arm hangs to let the shoulders drop and encourage deep breathing."
    },
        {
      id: "step6",
      title: "Golf Swings",
      text: "Smooth, hip - driven rotational swings to challenge balance and core control."
    },
        {
      id: "step7",
      title: "Marches",
      text: "Upright, active marching in place to elevate energy and coordination."
    },
        {
      id: "step8",
      title: "Ballet Squats",
      text: "Shallow, controlled squats with an upright torso to engage legs and hips."
    },
        {
      id: "step9",
      title: "Horse Stance",
      text: "A wide, grounded, static or low stance to build lower- body endurance and focus."
    }
  ],

finalCard: {
  eyebrow: "SESSION FINISHED",
    counter: "Complete",
      icon: "✓",
        title: "Session complete",
          text: "You have reached the end of the session. Well Done!",
            buttonText: "Start again"
}
};
