import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  customType,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * OpenFGA Goose Migration Table
 * This table is used to track the version of the OpenFGA schema.
 *
 * DO NOT MODIFY THESE DEFINITIONS MANUALLY.
 */

const bytea = customType<{ data: string; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
  toDriver(val) {
    let newVal = val;
    if (val.startsWith('0x')) {
      newVal = val.slice(2);
    }

    return Buffer.from(newVal, 'hex');
  },
  // biome-ignore lint/suspicious/noExplicitAny: lazy
  fromDriver(val: any) {
    return val.toString('hex');
  },
});

export const gooseDbVersion = pgTable('goose_db_version', {
  id: integer().primaryKey().generatedByDefaultAsIdentity({
    name: 'goose_db_version_id_seq',
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  versionId: bigint('version_id', { mode: 'number' }).notNull(),
  isApplied: boolean('is_applied').notNull(),
  tstamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const store = pgTable('store', {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
});

export const assertion = pgTable(
  'assertion',
  {
    store: text().notNull(),
    authorizationModelId: text('authorization_model_id').notNull(),
    assertions: bytea('assertions'),
  },
  (table) => [
    primaryKey({
      columns: [table.store, table.authorizationModelId],
      name: 'assertion_pkey',
    }),
  ],
);

export const authorizationModel = pgTable(
  'authorization_model',
  {
    store: text().notNull(),
    authorizationModelId: text('authorization_model_id').notNull(),
    type: text().notNull(),
    typeDefinition: bytea('type_definition'),
    schemaVersion: text('schema_version').default('1.0').notNull(),
    serializedProtobuf: bytea('serialized_protobuf'),
  },
  (table) => [
    primaryKey({
      columns: [table.store, table.authorizationModelId, table.type],
      name: 'authorization_model_pkey',
    }),
  ],
);

export const tuple = pgTable(
  'tuple',
  {
    store: text().notNull(),
    objectType: text('object_type').notNull(),
    objectId: text('object_id').notNull(),
    relation: text().notNull(),
    user: text('_user').notNull(),
    userType: text('user_type').notNull(),
    ulid: text().notNull(),
    insertedAt: timestamp('inserted_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    conditionName: text('condition_name'),
    conditionContext: bytea('condition_context'),
  },
  (table) => [
    index('idx_reverse_lookup_user').using(
      'btree',
      table.store.asc().nullsLast().op('text_ops'),
      table.objectType.asc().nullsLast().op('text_ops'),
      table.relation.asc().nullsLast().op('text_ops'),
      table.user.asc().nullsLast().op('text_ops'),
    ),
    index('idx_tuple_partial_user')
      .using(
        'btree',
        table.store.asc().nullsLast().op('text_ops'),
        table.objectType.asc().nullsLast().op('text_ops'),
        table.objectId.asc().nullsLast().op('text_ops'),
        table.relation.asc().nullsLast().op('text_ops'),
        table.user.asc().nullsLast().op('text_ops'),
      )
      .where(sql`(user_type = 'user'::text)`),
    index('idx_tuple_partial_userset')
      .using(
        'btree',
        table.store.asc().nullsLast().op('text_ops'),
        table.objectType.asc().nullsLast().op('text_ops'),
        table.objectId.asc().nullsLast().op('text_ops'),
        table.relation.asc().nullsLast().op('text_ops'),
        table.user.asc().nullsLast().op('text_ops'),
      )
      .where(sql`(user_type = 'userset'::text)`),
    uniqueIndex('idx_tuple_ulid').using(
      'btree',
      table.ulid.asc().nullsLast().op('text_ops'),
    ),
    primaryKey({
      columns: [
        table.store,
        table.objectType,
        table.objectId,
        table.relation,
        table.user,
      ],
      name: 'tuple_pkey',
    }),
  ],
);

export const changelog = pgTable(
  'changelog',
  {
    store: text().notNull(),
    objectType: text('object_type').notNull(),
    objectId: text('object_id').notNull(),
    relation: text().notNull(),
    user: text('_user').notNull(),
    operation: integer().notNull(),
    ulid: text().notNull(),
    insertedAt: timestamp('inserted_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    conditionName: text('condition_name'),
    conditionContext: bytea('condition_context'),
  },
  (table) => [
    primaryKey({
      columns: [table.store, table.objectType, table.ulid],
      name: 'changelog_pkey',
    }),
  ],
);
