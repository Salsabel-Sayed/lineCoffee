self.addEventListener("push", function (e) {
    const data = e.data?.json();
    const options = {
        body: data.body,
 
    };

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
