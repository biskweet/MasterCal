const IsCourseOIP = (code: string) => {
    return (
        code.endsWith("OIP")
    );
}

export { IsCourseOIP };
