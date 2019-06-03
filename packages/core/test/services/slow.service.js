module.exports = {
    name: 'slow',
    actions: {
        timeout: {
            handler (context) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve('yes')
                    }, 1000)
                })
            }
        },
    }
}
