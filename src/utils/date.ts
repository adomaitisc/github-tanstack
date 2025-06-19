export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  const diffInDecades = Math.floor(diffInYears / 10);
  const diffInCenturies = Math.floor(diffInYears / 100);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInDays === 1) {
    return "yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  } else if (diffInYears < 10) {
    return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
  } else if (diffInDecades < 10) {
    return `${diffInDecades} decade${diffInDecades === 1 ? "" : "s"} ago`;
  } else if (diffInCenturies < 10) {
    return `${diffInCenturies} centur${diffInCenturies === 1 ? "y" : "ies"} ago`;
  } else {
    return targetDate.toLocaleDateString();
  }
}
