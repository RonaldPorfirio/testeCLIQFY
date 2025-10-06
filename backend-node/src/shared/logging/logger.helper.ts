import { PinoLogger } from 'nestjs-pino';

export class LogHelper {
    constructor(private logger: PinoLogger, private context: string) {
        this.logger.setContext(context);
    }

    info(userId: number | null, action: string, details?: Record<string, any>) {
        this.logger.info(
            {
                userId,
                action,
                ...details,
            },
            `Action: ${action}`,
        );
    }

    warn(userId: number | null, action: string, details?: Record<string, any>) {
        this.logger.warn(
            {
                userId,
                action,
                ...details,
            },
            `Warn: ${action}`,
        );
    }

    error(userId: number | null, action: string, error: any, details?: Record<string, any>) {
        this.logger.error(
            {
                userId,
                action,
                error: error.message || error,
                stack: error.stack,
                ...details,
            },
            `Error: ${action}`,
        );
    }
}
