-- Database untuk phpunit (phpunit.xml memakai undangan_digital_test)
SELECT 'CREATE DATABASE undangan_digital_test OWNER undangan_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'undangan_digital_test')\gexec
