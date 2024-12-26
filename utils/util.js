const sharp = require("sharp");

function generateImage(
  inputPath = "visiting_card.png",
  outputPath = "path_to_your_images.png"
) {
  sharp(inputPath)
    .resize(639, 1014) // Resize to match printer resolution.
    .toFile(outputPath, (err, info) => {
      if (err) console.error("Error generating image:", err);
      else console.log("Image generated successfully:", info);
    });
}

function rgbToYMCK(r, g, b) {
  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const y = 1 - b / 255;
  const k = Math.min(c, m, y);
  return {
    y: y - k,
    m: m - k,
    c: c - k,
    k,
  };
}

const {Jimp} = require("jimp");
// const Jimp = require('jimp');

async function convertToYMCK(
  inputImage = "visiting_card.png",
  outputImage = "path_to_your_images.png"
) {
  const image = await Jimp.read(inputImage);

  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    function (x, pixelY, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      // Convert to YMCK
      const { y, m, c, k } = rgbToYMCK(r, g, b);

      // Update pixel data (example: setting to black for simplicity)
      this.bitmap.data[idx + 0] = c * 255;
      this.bitmap.data[idx + 1] = m * 255;
      this.bitmap.data[idx + 2] = y * 255;
    }
  );

   // Use write instead of writeAsync
   image.write(outputImage, (err) => {
    if (err) {
      console.error("Error saving image:", err);
    } else {
      console.log("Image saved successfully");
      sendToPrinter("path_to_your_images.png")
      sendToPrinters()
    }
  });


  sendToPrinter("path_to_your_images.png")
  // sendToPrinters() seems like zpl needed the java runtime environment
  // await image.writeAsync(outputImage);
}

// const zebra = require("zebra-sdk");

// export function printImage(imagePath) {
//   const printer = new zebra.Printer("192.168.0.100", 9100);

//   printer.printImage(imagePath, (err, result) => {
//     if (err) console.error("Print Error:", err);
//     else console.log("Print Success:", result);
//   });
// }

const net = require("net");
const fs = require("fs");

function sendToPrinter(
  imagePath = id_card_combined.jpg,
  printerIP = "192.168.0.100",
  printerPort = 9100
) {
  const client = new net.Socket();
  const imageData = fs.readFileSync(imagePath); // Read the image file

  client.connect(printerPort, printerIP, () => {
    console.log("Connected to printer");
    client.write(imageData); // Send the image to the printer
    client.end();
  });

  client.on("error", (err) => {
    console.error("Printer error:", err);
  });
}

// const net = require('net');
// const fs = require('fs');
const imageToZpl = require('image-to-zpl'); // Library to convert image to ZPL

function sendToPrinters(imagePath= "path_to_your_images.png", printerIP = "192.168.0.100", printerPort = 9100) {
    const client = new net.Socket();
    
    // Read the image
    // const imageData = fs.readFileSync(imagePath);

    // Convert the image to ZPL format
    imageToZpl(imagePath).then(zplCode => {
        // Connect to the printer
        client.connect(printerPort, printerIP, () => {
            console.log('Connected to printer');
            
            // Send ZPL code to the printer
            client.write(zplCode);
            client.end();
        });

        client.on('error', (err) => {
            console.error('Printer error:', err);
        });
    }).catch(err => {
        console.error('Error converting image to ZPL:', err);
    });
}

// Example usage
// sendToPrinter('path/to/your/image.png', '192.168.1.100');

// Example usage
// const imagePath = "path_to_your_image.png";
// sendToPrinter(imagePath);

// try
// const Jimp = require('jimp');

// Function to process RGB to YMCK format
function rgbToYMCK(r, g, b) {
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);
    return {
        c: Math.round((c - k) / (1 - k) * 255),
        m: Math.round((m - k) / (1 - k) * 255),
        y: Math.round((y - k) / (1 - k) * 255),
        k: Math.round(k * 255),
    };
}

// // Generate ID Card
// async function generateIDCard(backgroundPath, outputPath, textContent, textPosition) {
//     try {
//         // Load Background Image
//         const background = await Jimp.read(backgroundPath);

//         // Convert Background to YMCK Format
//         background.scan(0, 0, background.bitmap.width, background.bitmap.height, function (x, pixalY, idx) {
//             const r = this.bitmap.data[idx + 0];
//             const g = this.bitmap.data[idx + 1];
//             const b = this.bitmap.data[idx + 2];
//             const { y, m, c, k } = rgbToYMCK(r, g, b);

//             this.bitmap.data[idx + 0] = c; // Cyan
//             this.bitmap.data[idx + 1] = m; // Magenta
//             this.bitmap.data[idx + 2] = y; // Yellow
//             this.bitmap.data[idx + 3] = k; // Black (K)
//         });

//         // Save YMCK Processed Background
//         await background.write(`background_ymck.jpg`);

//         // Validate dimensions
//         const width = background.bitmap.width;
//         const height = background.bitmap.height;
//         console.log('Background dimensions:', { width, height });

//         if (!width || !height) {
//             throw new Error('Invalid background dimensions');
//         }

//          // Create Text Overlay
//          const overlay = new Jimp({
//           width: background.bitmap.width,
//           height: background.bitmap.height,
//       });


//         // // Create Text Overlay
//         // const overlay = new Jimp(width, height, 0x00000000); // Transparent

//         // // Create Text Overlay
//         // const overlay = new Jimp(background.bitmap.width, background.bitmap.height, 0x00000000); // Transparent

//         const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
//         overlay.print(font, textPosition.x, textPosition.y, textContent);

//         // Save Overlay as Separate Layer
//         await overlay.writeAsync(`${outputPath}/text_overlay.png`);

//         // Combine for Preview
//         const combined = background.clone();
//         combined.composite(overlay, 0, 0); // Combine Background and Text
//         await combined.write(`${outputPath}/id_card_combined.jpg`);

//         console.log('ID Card generated successfully!');
//     } catch (error) {
//         console.error('Error generating ID card:', error);
//     }
// }

const { createCanvas, loadImage } = require('canvas');
// const fs = require('fs');

async function generateIDCard(backgroundPath, textPosition, textContent, outputPath) {
    try {
        // Load the background image
        const background = await loadImage(backgroundPath);
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        // Draw the background image
        ctx.drawImage(background, 0, 0);

        // Set up the font and text color
        ctx.font = '32px sans-serif';
        ctx.fillStyle = 'white'; // White text

        // Draw the text overlay
        ctx.fillText(textContent, textPosition.x, textPosition.y);

        // Save the output image
        const buffer = canvas.toBuffer('image/jpeg');
        fs.writeFileSync(`id_card_combined.jpg`, buffer);

        console.log('ID card generated successfully!');
    } catch (error) {
        console.error('Error generating ID card:', error);
    }
}

// Call the Function
// generateIDCard(
//     './idcardtry.png',          // Path to background image
//     { x: 50, y: 100 }  ,          // Text position
//     'John Doe\nID: 1234567890',  // Text content
//     '',                  // Output directory
// );


module.exports={
  generateImage,
  rgbToYMCK,
  convertToYMCK,
  sendToPrinter
}