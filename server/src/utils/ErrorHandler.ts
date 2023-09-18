class ErrorHandler extends Error {
    statusCode: any;
    constructor(httpCode: number, message?: string) {
        super(message);
        if (httpCode)
            this.statusCode = httpCode;
        if (message)
            this.message = message;

        this.stack = new Error().stack;
    }
}

export default ErrorHandler;