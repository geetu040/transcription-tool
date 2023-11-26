function handleFileChange(event) {

	console.log(event);
	return;
    const input = event.target;
    const file = input.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("audioFile", file);

        // Replace 'YOUR_SERVER_ENDPOINT' with the actual endpoint where you want to handle the file
        const serverEndpoint = 'YOUR_SERVER_ENDPOINT';

        fetch(serverEndpoint, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('File uploaded successfully:', data);
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });
    }
}


console.log(document.getElementById('uploadBtn'))
// document.getElementById('uploadBtn').addEventListener('change', handleFileChange);