import { Component, OnInit } from "@angular/core";
import * as utils from "tns-core-modules/utils/utils";
import * as g from "tns-core-modules/ui/gestures";
import * as platform from 'platform';
import 'nativescript-websockets';
import { RxStompService } from "@stomp/ng2-stompjs";

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
    private nativeView;

    constructor(private rxStompService: RxStompService) {
        // Create an image container
        this.nativeView = new android.widget.ImageView(
            utils.ad.getApplicationContext()
        );

        // Set scale type. Super important for the touch event to get proper coords!
        this.nativeView.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
        this.nativeView.setAdjustViewBounds(false);
    }

    ngOnInit(): void {

    }

    onTouch(event: g.TouchGestureEventData) {
        let x = event.getX();
        let y = event.getY();

        if (event.action == 'up' || event.action == 'move') {
            // (x-h)^2 + (y-k)^2 = r^2
            let radius = Math.sqrt(Math.pow((x - 175), 2) + Math.pow(y - 200, 2));

            // If outside of the circle dont continue
            if (radius > this.radius) {
                return;
            }

            // Get the exact pixel touched in the view
            let color = this.bitmap.getPixel(x, y);
            let blue = android.graphics.Color.blue(color);
            let green = android.graphics.Color.green(color);
            let red = android.graphics.Color.red(color);

            // Display the color
            this.colorCoords = `R: ${red}, G: ${green}, B: ${blue}`;

            // Publish message to STOMP server
            const message = { red: red, green: green, blue: blue };
            this.rxStompService.publish({destination: '/topic/demo', body: JSON.stringify(message)});
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
        let xPos = ((this.width / 2) - radius) / 2;
        let yPos = (this.height / 2) - radius;
        // Move the circle to canvas center
        this.canvas.translate(xPos, yPos);

        // Create a new bitmap in which will make the color wheel
        let colorWheelBmp = this.bitmap.copy(android.graphics.Bitmap.Config.ARGB_8888, true);
        for (let x = -radius; x < radius; x++) {
            for (let y = -radius; y < radius; y++) {
                let polar = this.xyToPolar(x, y);
                let r = polar.radius;
                let phi = polar.phi;

                if (r > radius) {
                    continue;
                }

                let deg = this.rad2deg(phi);
                let oneDimensionX = x + radius;
                let oneDimensionY = y + radius;

                let hue = deg;
                let saturation = r / radius;
                // Convert to RGB
                let { red, green, blue } = this.hsv2rgb(hue, saturation, this.brightness);

                let paint = new android.graphics.Paint();
                paint.setARGB(255, red, green, blue);
                paint.setAntiAlias(true);
                // Draw the pixel with the proper HSV color
                colorWheelBmp.setPixel(oneDimensionX, oneDimensionY, paint.getColor());
            }
        }

        let rect = new android.graphics.Rect(0, 0, this.width, this.height);
        this.canvas.drawBitmap(colorWheelBmp, rect, rect, null);
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
