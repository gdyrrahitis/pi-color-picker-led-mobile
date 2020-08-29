import { Component, OnInit } from "@angular/core";
import * as utils from "tns-core-modules/utils/utils";
import * as g from "tns-core-modules/ui/gestures";
import * as platform from 'platform';

declare var android;
@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
    private radius = 150;
    private height = 400;
    private width = 400;
    private brightness = 1.0;
    private bitmap;
    private canvas;
    private colorCoords = "";
    //private coords = "";
    private nativeView;

    constructor() {
        this.nativeView = new android.widget.ImageView(
            utils.ad.getApplicationContext()
        );
        this.nativeView.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
        this.nativeView.setAdjustViewBounds(false);
    }

    ngOnInit(): void {
    }

    onTouch(event: g.TouchGestureEventData) {
        let x = event.getX();
        let y = event.getY();

        if (event.action == 'up' || event.action == 'move') {
            let radius = Math.sqrt(Math.pow((x - 175), 2) + Math.pow(y - 200, 2));
            if (radius > this.radius) {
                return;
            }

            let color = this.bitmap.getPixel(x, y);
            let blue = android.graphics.Color.blue(color);
            let green = android.graphics.Color.green(color);
            let red = android.graphics.Color.red(color);
            //this.coords = `X: ${x} Y: ${y}`;
            this.colorCoords = `R: ${red}, G: ${green}, B: ${blue}`;
        }
    }

    createCanvasView(event) {
        this.bitmap = android.graphics.Bitmap.createBitmap(
            this.width,
            this.height,
            android.graphics.Bitmap.Config.ARGB_8888,
            true
        );
        let radius = this.radius;
        this.canvas = new android.graphics.Canvas(this.bitmap);
        this.canvas.drawARGB(0, 0, 0, 0);
        let rect = new android.graphics.Rect(0, 0, this.width, this.height);
        let xWidth = ((this.width / 2) - this.radius) / 2;
        let yHeight = (this.height / 2) - this.radius;
        this.canvas.translate(xWidth, yHeight);
        let mybmp = this.bitmap.copy(android.graphics.Bitmap.Config.ARGB_8888, true)
        for (let x = -radius; x < radius; x++) {
            for (let y = -radius; y < radius; y++) {
                let polar = this.xyToPolar(x, y);
                let r = polar.radius;
                let phi = polar.phi;

                if (r > radius) {
                    continue;
                }

                let deg = this.rad2deg(phi)
                let adjustedX = x + radius
                let adjustedY = y + radius

                let hue = deg;
                let saturation = r / radius;
                let result = this.hsv2rgb(hue, saturation, this.brightness)
                let red = result.red;
                let green = result.green;
                let blue = result.blue;

                let paint = new android.graphics.Paint();
                paint.setARGB(255, red, green, blue);
                paint.setAntiAlias(true);
                mybmp.setPixel(adjustedX, adjustedY, paint.getColor());
            }
        }

        this.canvas.drawBitmap(mybmp, rect, rect, null);
        this.nativeView.setImageBitmap(this.bitmap);
        event.view = this.nativeView;
    }

    xyToPolar(x, y) {
        let radius = Math.sqrt(x * x + y * y);
        let phi = Math.atan2(y, x);
        return { radius: radius, phi: phi };
    }

    rad2deg(rad) {
        return ((rad + Math.PI) / (2 * Math.PI)) * 360;
    }

    hsv2rgb(hue, saturation, brightness) {
        let chroma = brightness * saturation;
        let hue1 = hue / 60;
        let x = chroma * (1 - Math.abs((hue1 % 2) - 1));
        let r1, g1, b1;
        if (hue1 >= 0 && hue1 <= 1) {
            r1 = chroma
            g1 = x
            b1 = 0
        } else if (hue1 >= 1 && hue1 <= 2) {
            r1 = x
            g1 = chroma
            b1 = 0
        } else if (hue1 >= 2 && hue1 <= 3) {
            r1 = 0
            g1 = chroma
            b1 = x
        } else if (hue1 >= 3 && hue1 <= 4) {
            r1 = 0
            g1 = x
            b1 = chroma
        } else if (hue1 >= 4 && hue1 <= 5) {
            r1 = x
            g1 = 0
            b1 = chroma
        } else if (hue1 >= 5 && hue1 <= 6) {
            r1 = chroma
            g1 = 0
            b1 = x
        }

        let m = brightness - chroma;
        let r = r1 + m;
        let g = g1 + m;
        let b = b1 + m;

        // Change r,g,b values from [0,1] to [0,255]
        return {
            red: 255 * r,
            green: 255 * g,
            blue: 255 * b
        };
    }
}
