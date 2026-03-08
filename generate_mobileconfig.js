import fs from 'fs';
import crypto from 'crypto';

// Configuration
const url = 'https://neobankultimate.vercel.app';
const label = 'NeoBank';
const imagePath = './logo.png'; // Make sure the user saves their logo here
const outputPath = './neobank.mobileconfig';

try {
  // Read and encode the image
  const imageBuf = fs.readFileSync(imagePath);
  const base64Image = imageBuf.toString('base64');

  // Generate unique UUIDs for the profile payloads
  const payloadUUID = crypto.randomUUID().toUpperCase();
  const profileUUID = crypto.randomUUID().toUpperCase();

  // Create the XML structure
  const mobileConfigXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>FullScreen</key>
			<true/>
			<key>Icon</key>
			<data>${base64Image}</data>
			<key>IsRemovable</key>
			<true/>
			<key>Label</key>
			<string>${label}</string>
			<key>PayloadDescription</key>
			<string>Configures Web Clip</string>
			<key>PayloadDisplayName</key>
			<string>Web Clip</string>
			<key>PayloadIdentifier</key>
			<string>com.apple.webClip.managed.${payloadUUID}</string>
			<key>PayloadType</key>
			<string>com.apple.webClip.managed</string>
			<key>PayloadUUID</key>
			<string>${payloadUUID}</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>Precomposed</key>
			<true/>
			<key>URL</key>
			<string>${url}</string>
		</dict>
	</array>
	<key>PayloadDisplayName</key>
	<string>${label} Web App</string>
	<key>PayloadIdentifier</key>
	<string>com.neobank.webapp.${profileUUID}</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>${profileUUID}</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>
`;

  fs.writeFileSync(outputPath, mobileConfigXML);
  console.log(`Successfully generated ${outputPath}!`);
  console.log('You can now send this file to your iPhone (e.g., via AirDrop or Email) to install it on your home screen.');

} catch (err) {
  console.error('Error generating mobileconfig:', err.message);
  console.log('Please ensure you have saved the logo as "logo.png" in this folder.');
}
