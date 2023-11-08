# YAML Configuration (beta)

## YAML Tags

### !include

Include yaml/json/text from another resources.

Supports:

- Get file from local machine.
- Get file from the internet via http or https request.
- Get file from AWS S3.

For example:

```yaml
localFile: !include config/example.com
s3File: !include s3://bucket/s3_object_key
httpFie: !include https://example.com/example.yaml
```
