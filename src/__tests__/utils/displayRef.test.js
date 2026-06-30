import { displayRef } from '../../utils/displayRef.js';

describe('displayRef', () => {
  test('returns "—" for null', () => {
    expect(displayRef(null)).toBe('—');
  });

  test('returns "—" for undefined', () => {
    expect(displayRef(undefined)).toBe('—');
  });

  test('returns entity.ref when present', () => {
    expect(displayRef({ ref: 'JOB-A3K8T2', id: 'some-uuid' })).toBe('JOB-A3K8T2');
  });

  test('ref takes priority over id', () => {
    expect(displayRef({ ref: 'ORD-XYZ123', id: 'abc123' })).toBe('ORD-XYZ123');
  });

  test('returns PREFIX-SHORTID when no ref but prefix given', () => {
    const result = displayRef({ id: 'abcd1234-efgh-5678' }, 'ORD');
    expect(result).toBe('ORD-ABCD1234');
  });

  test('returns #SHORTID when no ref and no prefix', () => {
    const result = displayRef({ id: 'abcd1234-efgh' });
    expect(result).toBe('#ABCD1234');
  });

  test('shortid is uppercased', () => {
    const result = displayRef({ id: 'abcdefgh-rest' });
    expect(result).toBe('#ABCDEFGH');
  });

  test('returns "—" when no ref and empty id', () => {
    expect(displayRef({ ref: null, id: '' })).toBe('—');
  });

  test('returns "—" when entity has neither ref nor id', () => {
    expect(displayRef({})).toBe('—');
  });

  test('works with just a ref string field', () => {
    expect(displayRef({ ref: 'PAY-TEST99' })).toBe('PAY-TEST99');
  });
});
