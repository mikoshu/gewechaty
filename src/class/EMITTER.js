

class EventEmitter {
  constructor() {
    this.EventNames = []
    this.events = {}
  }

  setEventNames(eventNames) {
    this.EventNames.push(...eventNames)
  }

  on(eventName, callback, force) {
    if(!this.EventNames.includes(eventName) && !force){
      throw new Error('event not found')
    }
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(callback)
  }

  once(eventName, callback) {
    const onceCallback = (...args) => {
      callback(...args)
      this.off(eventName, onceCallback)
    }
    this.on(eventName, onceCallback)
  }

  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(fn => fn !== callback)
    }
  }

  removeAllListeners(eventName) {
    if (this.events[eventName]) {
      this.events[eventName] = []
    }
  }

  emit(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        callback.apply(this, args)
      })
    }
  }

  listenerCount(eventName) {
    if (this.events[eventName]) {
      return this.events[eventName].length
    }
    return 0
  }

}

export default EventEmitter