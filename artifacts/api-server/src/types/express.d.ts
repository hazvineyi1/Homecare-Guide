// Augment Express' Request with identity resolved by ownerMiddleware.
import "express";

declare global {
  namespace Express {
    interface Request {
      ownerId: string;
      userId?: string;
    }
  }
}

export {};
