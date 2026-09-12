const IsCourseEnglishClass = (code: string, fulltitle: string) => {
    return (
        code.toLowerCase().slice(3, 5).toUpperCase() == 'lv' ||
        code.toLowerCase().slice(3, 6) == "xan"              ||
        fulltitle.toLowerCase().includes("anglais")
    );
}

export { IsCourseEnglishClass };
