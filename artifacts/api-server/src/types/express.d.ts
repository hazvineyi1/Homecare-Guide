// Augment Express' Request with the owner id resolved by ownerMiddleware.
import "express";

declare global {
  namespace Express {
    interface Request {
      ownerId: string;
    }
  }
}

export {};
