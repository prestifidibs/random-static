var HAS_UINT32_ARRAY = !(typeof Uint32Array === 'undefined')
var USE_UINT32_ARRAY = false // Benchmarks show this to be slower than Array's. Hrmph.


var bits_per_word = 32
  , address_shift = 5 // log2(bits_per_word)


/**
 * Create a new bit set. If a size is provided an array will be allocated
 * upfront, which speeds up writes and test operations since bitwise operations
 * against undefined require a cast. Providing a size will fix the bitset to
 * exactly that size, whereas unsized bitsets grow automatically.
 *
 * The size of the BitSet is rounded up to the next multiple of 32
 * automatically.
 *
 * If the Typed Uint32Array is available it is used for fixed size sets.
 **/
var BitSet = function BitSet(size, words) {
    if (!(this instanceof BitSet)) {
        return new BitSet()
    }

    var fixed = (size ? true : false)

    size = (fixed ? (Math.ceil(size / bits_per_word) * bits_per_word) : void 0)

    if (!(typeof words === 'undefined')) {
        this.words = words
    } else if (fixed) {
        var word_length = size / bits_per_word
        if (USE_UINT32_ARRAY) {
            var buffer = new Buffer(word_length * 4)
            buffer.fill(0)
            this.words = new Uint32Array(buffer)
        } else {
            this.words = new Array(word_length)
            for (var i = 0; i < word_length; i++) {
                this.words[i] = 0
            }
        }
    } else {
        this.words = []
    }

    var index = function(position) {
        if (fixed && position >= size) {
            throw new Error('position ' + position + ' exceeds size ' + size)
        }
        return position >> address_shift
    }

    this.word_length = function() {
        if (fixed) {
            return this.words.length
        } else {
            var length = this.words.length

            for (var i = this.words.length - 1; i >= 0; i--) {
                if (this.words[i] !== 0) {
                    break
                }
                length -= 1
            }

            return length
        }
    }

    this.set = function BitSet_set(position) {
        return this.words[index(position)] |= 1 << position
    }

    this.clear = function BitSet_clear(position) {
        return this.words[index(position)] &= ~(1 << position)
    }

    this.get = function BitSet_get(position) {
        return (this.words[index(position)] & (1 << position)) !== 0
    }

    this.flip = function BitSet_flip(position) {
        return this.words[index(position)] ^= (1 << position);
    }

    this.fixed = function BitSet_fixed() {
        return fixed
    }

    this.size = function BitSet_size() {
        return size
    }

    this.is_empty = function BitSet__is_empty() {
        for (var i = 0, ii = this.word_length(); i < ii; i++) {
            if (this.words[i]) {
                return 0
            }
        }
        return 1
    }
}
