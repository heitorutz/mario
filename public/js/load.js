export const loadImage = (url) => {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    })
};

export const loadJSON = (url) => {
    return fetch(url).then(r => r.json());
};



