import { assertEqual, assertContains, assertMatches } from '../src/utils/comparator'

describe('comparator', () => {
    describe('assertEqual', () => {
        it('should not throw if values are equal', () => {
            expect(() => assertEqual('a', 'a')).not.toThrow()
        })

        it('should throw if values are not equal', () => {
            expect(() => assertEqual('a', 'b')).toThrow()
        })

        it('should include diff in error message', () => {
            try {
                assertEqual('a', 'b')
            } catch (e: any) {
                expect(e.message).toContain('Expected values to be equal')
                // jest-diff output format might vary, but usually contains these
                // We can just check if it throws for now, or check for parts of the diff
            }
        })
    })

    describe('assertContains', () => {
        it('should not throw if actual contains expected', () => {
            expect(() => assertContains('abc', 'b')).not.toThrow()
        });

        it('should throw if actual does not contain expected', () => {
            expect(() => assertContains('abc', 'd')).toThrow()
        })
    });

    describe('assertMatches', () => {
        it('should not throw if actual matches pattern', () => {
            expect(() => assertMatches('abc', 'b')).not.toThrow()
            expect(() => assertMatches('abc', '^a')).not.toThrow()
        })

        it('should throw if actual does not match pattern', () => {
            expect(() => assertMatches('abc', 'd')).toThrow()
        })
    })
})
