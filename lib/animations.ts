export const springTransition = {
  type: "spring",
  damping: 20,
  stiffness: 300
}

export const slideInVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: springTransition
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { ...springTransition, damping: 25 }
  }
}

export const scaleInVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: springTransition
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { ...springTransition, damping: 25 }
  }
}

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
} 