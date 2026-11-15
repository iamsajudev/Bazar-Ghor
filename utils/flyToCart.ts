export const flyToCart = (imageUrl: string, startElement: HTMLElement, targetId: string = "cart-icon-target") => {
    const targetIcon = document.getElementById(targetId);
    if (!targetIcon) {
        console.warn(`Target icon "${targetId}" not found!`);
        return;
    }

    const targetRect = targetIcon.getBoundingClientRect();
    const startRect = startElement.getBoundingClientRect();

    const flyingImage = document.createElement("img");
    flyingImage.src = imageUrl;
    
    flyingImage.style.position = "fixed";
    flyingImage.style.left = `${startRect.left}px`;
    flyingImage.style.top = `${startRect.top}px`;
    flyingImage.style.width = `${startRect.width}px`;
    flyingImage.style.height = `${startRect.height}px`;
    flyingImage.style.zIndex = "99999";
    flyingImage.style.pointerEvents = "none";
    flyingImage.style.objectFit = "contain";
    flyingImage.style.transition = "all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
    
    document.body.appendChild(flyingImage);

    requestAnimationFrame(() => {
        flyingImage.style.left = `${targetRect.left + targetRect.width / 2 - 20}px`;
        flyingImage.style.top = `${targetRect.top + targetRect.height / 2 - 20}px`;
        flyingImage.style.width = "40px";
        flyingImage.style.height = "40px";
        flyingImage.style.opacity = "0.5";
        flyingImage.style.transform = "rotate(360deg)";
    });

    setTimeout(() => {
        if (document.body.contains(flyingImage)) {
            document.body.removeChild(flyingImage);
        }
    }, 800);
};