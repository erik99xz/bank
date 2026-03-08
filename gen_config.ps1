$imageBuf = [System.IO.File]::ReadAllBytes("d:\A.ERIK\vt-bank\logo.png")
$base64Image = [System.Convert]::ToBase64String($imageBuf)
$payloadUUID = [System.Guid]::NewGuid().ToString().ToUpper()
$profileUUID = [System.Guid]::NewGuid().ToString().ToUpper()
$label = "NeoBank"
$url = "https://neobankultimate.vercel.app"

$xml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>
<!DOCTYPE plist PUBLIC `"-//Apple//DTD PLIST 1.0//EN`" `"http://www.apple.com/DTDs/PropertyList-1.0.dtd`">
<plist version=`"1.0`">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>FullScreen</key>
			<true/>
			<key>Icon</key>
			<data>$base64Image</data>
			<key>IsRemovable</key>
			<true/>
			<key>Label</key>
			<string>$label</string>
			<key>PayloadDescription</key>
			<string>Configures Web Clip</string>
			<key>PayloadDisplayName</key>
			<string>Web Clip</string>
			<key>PayloadIdentifier</key>
			<string>com.apple.webClip.managed.$payloadUUID</string>
			<key>PayloadType</key>
			<string>com.apple.webClip.managed</string>
			<key>PayloadUUID</key>
			<string>$payloadUUID</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>Precomposed</key>
			<true/>
			<key>URL</key>
			<string>$url</string>
		</dict>
	</array>
	<key>PayloadDisplayName</key>
	<string>$label Web App</string>
	<key>PayloadIdentifier</key>
	<string>com.neobank.webapp.$profileUUID</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>$profileUUID</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>"

[System.IO.File]::WriteAllText("d:\A.ERIK\vt-bank\neobank.mobileconfig", $xml, [System.Text.Encoding]::UTF8)
Write-Host "Done! neobank.mobileconfig generated with logo.png"
