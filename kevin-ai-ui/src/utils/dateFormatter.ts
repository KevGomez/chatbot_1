export const formatTime = (timestamp: number): string => {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(timestamp));
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};
