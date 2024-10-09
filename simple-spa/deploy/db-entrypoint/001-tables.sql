-- This file is used to create an empty database for the application.
-- It will be automatically executed if it is included as a docker volume in docker-entrypoint-initdb.d
CREATE TABLE cache (
    id SERIAL PRIMARY KEY,
    type varchar(100),
    query text NOT NULL,
    data jsonb,
    created timestamp DEFAULT NOW()
);
COMMENT ON TABLE cache IS 'Stores resource-intensive operations (like http requests) so they can be loaded quickly.';
COMMENT ON COLUMN cache.type IS 'The type of data being stored. This is just an arbitrary string to group entries.';
COMMENT ON COLUMN cache.query IS 'The query that was used to generate the data. Together with type, this is how the data is retrieved.';
COMMENT ON COLUMN cache.data IS 'The data that was generated by the query.';
COMMENT ON COLUMN cache.created IS 'The timestamp when this cache entry was created.';

CREATE TABLE settings (
    settings_id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    label VARCHAR(200),
    description TEXT,
    default_value TEXT,
    use_default_value BOOLEAN DEFAULT FALSE,
    input_type VARCHAR(100) DEFAULT 'textarea',
    categories TEXT[]
);
COMMENT ON TABLE settings IS 'Settings table for storing key-value pairs of configuration data. So we dont have to hard code so many values in the application.';
COMMENT ON COLUMN settings.key IS 'The key for the setting. Usually will be unique to a category, but does not have to be.';
COMMENT ON COLUMN settings.value IS 'The user-entered value for the setting.';
COMMENT ON COLUMN settings.label IS 'The label to display for the setting on the admin settings page.';
COMMENT ON COLUMN settings.description IS 'The description to display for the setting on the admin settings page.';
COMMENT ON COLUMN settings.default_value IS 'The default value to use if use_default_value is true. If present, user will be able to revert to this value.';
COMMENT ON COLUMN settings.use_default_value IS 'The value will be ignored and default_value column will be used instead.';
COMMENT ON COLUMN settings.input_type IS 'The type of input to use for this setting on the admin settings page. Options are text, textarea';
COMMENT ON COLUMN settings.categories IS 'List of categories that this setting belongs to. Client will typically use this to query for the settings it needs. To appear on the admin settings page, one of the categories must be "adminSettings"';

-- TODO: Add your tables and schema stuff here
CREATE TABLE foo (
    id SERIAL PRIMARY KEY,
    name varchar(100)
);