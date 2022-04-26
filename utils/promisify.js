export default function promisify(callbackBasedAPI) {
    return function promisified(...args) {
        return new Promise((resolve, reject) => {
            const newArgs = [
                ...args,
                (err, result) => {
                    if (err) reject(err)
                    resolve(result)
                }
            ]
            callbackBasedAPI(...newArgs)
        })
    }
}