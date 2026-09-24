// The preview export uses its repository path; local and server builds stay at /.
export const sitePath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
