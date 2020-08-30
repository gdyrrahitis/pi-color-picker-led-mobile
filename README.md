# Color picker
A demo mobile application which creates an HSV color wheel from scratch and controls an RGB LED remotely by publishing the color values to a STOMP topic.

## Usage
*Given you have NativeScript installed.*

1. Clone the repository
2. On application root, open a terminal and build the app: `tns build android`
3. To open the app on your phone run the `tns preview` command. You need to install the **NativeScript Playground** and **NativeScript Preview** apps respectively on your phone. Then you can scan the QR code and the app will open on your phone! Otherwise, you can just plug your phone in and enable the [Developer Mode](https://developer.android.com/studio/debug/dev-options) and run the `tns run android` command.

To make it work on your local setup (given you have a RabbitMQ server configured with the Web STOMP plugin), please change the connection string on the `app.module.ts` script.