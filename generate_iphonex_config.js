import fs from 'fs';
import crypto from 'crypto';

// Configuration for iPhone X Optimized Profile
const url = 'https://neobankvn.vercel.app/';
const label = 'NeoBank Premium'; // Distinct label
const imagePath = './logo.png';
const outputPath = './neobank_iphonex.mobileconfig';

function generateUUID() {
    return crypto.randomUUID().toUpperCase();
}

const iconBase64 = fs.readFileSync(imagePath).toString('base64');
const profileUUID = generateUUID();
const webClipUUID = generateUUID();

const mobileConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>FullScreen</key>
			<true/>
			<key>Icon</key>
			<data>
${iconBase64.match(/.{1,76}/g).join('\n')}
			</data>
			<key>IsRemovable</key>
			<true/>
			<key>Label</key>
			<string>${label}</string>
			<key>PayloadDescription</key>
			<string>Configures Web Clip for iPhone X</string>
			<key>PayloadDisplayName</key>
			<string>Web Clip (NeoBank)</string>
			<key>PayloadIdentifier</key>
			<string>com.apple.webClip.managed.${webClipUUID}</string>
			<key>PayloadType</key>
			<string>com.apple.webClip.managed</string>
			<key>PayloadUUID</key>
			<string>${webClipUUID}</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>Precomposed</key>
			<true/>
			<key>URL</key>
			<string>${url}</string>
			<key>TargetApplicationBundleIdentifier</key>
			<string>com.apple.mobilesafari</string>
		</dict>
	</array>
	<key>PayloadDescription</key>
	<string>NeoBank iPhone X Optimized Profile</string>
	<key>PayloadDisplayName</key>
	<string>NeoBank iPhone X</string>
	<key>PayloadIdentifier</key>
	<string>vn.neobank.config.iphonex</string>
	<key>PayloadOrganization</key>
	<string>NeoBank</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>${profileUUID}</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>`;

fs.writeFileSync(outputPath, mobileConfig);
console.log('iPhone X Optimized MobileConfig generated at ' + outputPath);
