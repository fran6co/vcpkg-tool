// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.


import { Index, IndexSchema, SemverKey, StringKey } from '@microsoft/vcpkg-ce/dist/registries/indexer';
import { keys, Record } from '@microsoft/vcpkg-ce/dist/util/linq';
import { describe, it } from 'mocha';
import { SemVer } from 'semver';
import { SuiteLocal } from './SuiteLocal';

interface TestData {
  id: string,
  version: SemVer;
  summary?: string;
  description?: string;
  contacts?: Record<string, {
    email?: string;
    role?: Array<string>;
  }>
}


/** An Index implementation for TestData */
class MyIndex extends IndexSchema<TestData, MyIndex> {
  id = new StringKey(this, (i) => i.id);
  version = new SemverKey(this, (i) => new SemVer(i.version));
  description = new StringKey(this, (i) => i.description);

  contacts = new StringKey(this, (i) => keys(i.contacts)).with({
    email: new StringKey(this, (i, index: string) => i.contacts?.[index]?.email)
  });
}


// sample test using decorators.
describe('Index Tests', () => {
  it('Create index from some data', () => {
    const index = new Index<TestData, MyIndex>(MyIndex);

    index.insert({
      id: 'bob',
      version: new SemVer('1.2.3')
    }, 'foo/bob');

    index.insert({
      id: 'wham/blam/sam',
      version: new SemVer('0.0.4'),
      description: 'this is a test'
    }, 'other/sam');

    index.insert({
      id: 'tom',
      version: new SemVer('2.3.4'),
      contacts: {
        'bob Smith': {
          email: 'garrett@contoso.org'
        },
        'rob Smith': {
          email: 'tarrett@contoso.org'
        },
      }
    }, 'foo/tom');

    index.insert({
      id: 'sam/blam/bam',
      version: new SemVer('0.3.1'),
      description: 'this is a test'
    }, 'sam/blam/bam');

    const data = index.serialize();
    const index2 = new Index<TestData, MyIndex>(MyIndex);
    index2.deserialize(data);
    const results2 = index.where.
      version.greaterThan(new SemVer('0.3.0')).
      items;

    SuiteLocal.log(results2);
  });
});
