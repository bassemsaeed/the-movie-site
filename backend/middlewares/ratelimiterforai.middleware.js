import { rateLimit } from "express-rate-limit";

const limit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (req, res, next) => {
    const resetTime = req.rateLimit.resetTime;
    const now = new Date();

    const timeLeftMs = resetTime.getTime() - now.getTime();

    const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor(
      (timeLeftMs % (1000 * 60 * 60)) / (1000 * 60),
    );

    const hourTextEn = hoursLeft === 1 ? "hour" : "hours";
    const minuteTextEn = minutesLeft === 1 ? "minute" : "minutes";

    const messageEn = `You have exceeded the daily request limit. Your limit will be reset in ${hoursLeft} ${hourTextEn} and ${minutesLeft} ${minuteTextEn}.`;

    const messageAr = `لقد تجاوزت الحد اليومي للطلبات. سيتم تجديد الحد الخاص بك خلال ${hoursLeft} ساعة و ${minutesLeft} دقيقة.`;

    req.rateLimitReached = {
      limitReached: true,
      messages: {
        en: messageEn,
        ar: messageAr,
      },
    };

    next();
  },
});

export { limit };
