import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly yourUseCaseService: YourUseCaseService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Extract JWT token from the request and validate it using your use case service
    // Return true if the token is valid, otherwise false
    return true;
  }
}
