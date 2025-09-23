const IsCourseOIP = (code: string) => {
    return (
        code.toUpperCase().includes("OIP")
    );
}

export { IsCourseOIP };
