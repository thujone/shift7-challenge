import Splide from '../@splidejs/splide/dist/js/splide.esm.js';

export const VIEWPORT_MODES = {
    MOBILE: "MOBILE",
    DESKTOP: "DESKTOP"
}

export const VIEWPORT_BREAKPOINT = 1024;

export default class ProductPage {
    constructor() {
        this.header = document.querySelector('header');
        this.openSlideoutButton = document.querySelector('.open-slideout-button');
        this.closeSlideoutButton = document.querySelector('.close-slideout-button');
        this.mainSliderSelector = '#main-slider';
        this.mobileSliderSelector = '#mobile-slider';
        this.thumbnails = document.getElementById('thumbnails');
        this.mainSliderList = document.getElementById('main-slider-list');
        this.mobileSliderList = document.getElementById('mobile-slider-list');
        this.viewportWidth = window.innerWidth;
        this.viewportMode = this.viewportWidth < VIEWPORT_BREAKPOINT ?
                VIEWPORT_MODES.MOBILE : VIEWPORT_MODES.DESKTOP;
        this.productId = 101;
        this.apiUrl = `http://localhost:3030/products/${this.productId}`;
        this.productDirectory = null;
        this.mobileCarousel = null;
        this.desktopCarousel = null;
    }

    initialize() {
        this.fetchProductData(this.productId, (productData) => {
            this.initializeCarousels(productData);
        });
        this.addSlideoutButtonListeners();
        this.addResizeListener();
        console.log('ProductPage.initialize() called.');

    }

    fetchProductData(productId, callback) {
        fetch(this.apiUrl).then(response =>
            response.json()
        ).then(productData => {
            console.log('ProductPage.fetchProductData()::productData', productData);
            callback(productData);
        });
    }

    initializeCarousels(productData) {
        this.productDirectory = productData['friendly-name'];
        if (productData.photos.length > 0) {
            this.generateDesktopSliderMarkup(productData.photos);
            this.createDesktopCarousel();
            this.addDesktopListeners();
            this.generateMobileSliderMarkup(productData.photos);
            this.createMobileCarousel();
        } else {
            console.log('ProductData.initializeCarousels(): No alternate photos for product');
        }
    }

    generateDesktopSliderMarkup(photos) {
        const thumbMarkupStrings = photos.map(x => this.getThumbSlideMarkup(x.title, x.thumb));
        const thumbHtmlFragment = document.createRange().createContextualFragment(thumbMarkupStrings.join('\n'));
        this.thumbnails.appendChild(thumbHtmlFragment);
        const mediumSizeMarkupStrings = photos.map(x => this.getMediumSizeSlideMarkup(x.title, x.medium));
        const mediumSizeHtmlFragment = document.createRange().createContextualFragment(mediumSizeMarkupStrings.join('\n'));
        this.mainSliderList.appendChild(mediumSizeHtmlFragment);
    }

    generateMobileSliderMarkup(photos) {
        const mediumSizeMarkupStrings = photos.map(x => this.getMediumSizeSlideMarkup(x.title, x.medium));
        const mediumSizeHtmlFragment = document.createRange().createContextualFragment(mediumSizeMarkupStrings.join('\n'));
        this.mobileSliderList.appendChild(mediumSizeHtmlFragment);
    }

    getThumbSlideMarkup(title, thumb) {
        return `
            <li class="thumbnail">
                <img alt="${title}" src="product-images/${this.productDirectory}/${thumb}">
            </li>
        `;
    }

    getMediumSizeSlideMarkup(title, medium) {
        return `
            <li class="splide__slide">
                <img alt="${title}" src="product-images/${this.productDirectory}/${medium}">
            </li>
        `;
    }

    addSlideoutButtonListeners() {
        [this.openSlideoutButton, this.closeSlideoutButton].forEach(item => {
            item.addEventListener('click', () => {
                this.header.classList.toggle('opened');
            }, false);
        });
    }

    createDesktopCarousel() {
        this.desktopCarousel = new Splide(this.mainSliderSelector, {
            fixedHeight: 429,
            gap: 10,
            rewind: true,
            pagination: false,
            wheel: true,
            height: 350
        }).mount();
    }

    addDesktopListeners() {
        Array.from(document.getElementsByClassName('thumbnail')).forEach((item, i) => {
            item.addEventListener('click', () => {
                this.desktopCarousel.go(i);
            })
        })
    }

    createMobileCarousel() {
        this.mobileCarousel = new Splide(this.mobileSliderSelector, {
            pagination: true,
            height: 429
        }).mount();
    }

    addResizeListener() {
        window.addEventListener('resize', () => {
            this.viewportWidth = window.innerWidth;
            this.setViewportMode(this.viewportWidth);
            console.log(
                'ProductPage.addResizeListener()::this.viewportWidth',
                this.viewportWidth,
                '::this.viewportMode',
                this.viewportMode
            );
        }, false);
    }

    setViewportMode(viewportWidth) {
        if (viewportWidth < VIEWPORT_BREAKPOINT) {

            // Check to see if we need to switch from desktop to mobile viewportMode
            if (this.viewportMode !== VIEWPORT_MODES.MOBILE) {

                // Get the index of the desktop carousel and sync the mobile to it
                const desktopIndex = this.desktopCarousel.index;
                this.mobileCarousel.go(desktopIndex);
            }
            this.viewportMode = VIEWPORT_MODES.MOBILE;
        } else {
            // Check to see if we need to switch from mobile to desktop viewportMode
            if (this.viewportMode !== VIEWPORT_MODES.DESKTOP) {

                // Get the index of the mobile carousel and sync the desktop to it
                const mobileIndex = this.mobileCarousel.index;
                this.desktopCarousel.go(mobileIndex);

            }
            this.viewportMode = VIEWPORT_MODES.DESKTOP;
        }
    }

}