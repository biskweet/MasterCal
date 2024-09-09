const IsCourseEnglishClass = (code: string) => {
    return (
        code.slice(3, 5).toUpperCase() == 'LV' ||
        code.slice(3, 6) == "XAN"
    );
}

export { IsCourseEnglishClass };
