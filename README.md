# Create Cloudflare DNS Record Action for GitHub

Creates new CloudFlare DNS record.
Updates the record if it already exists.

## Usage via Github Actions

```yaml
name: example
on:
  pull_request:
    type: [opened, reopened]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: kourawealthtech/cf-ensure-dns-record@v1.0
        with:
          type: "A"
          name: "review.example.com"
          content: "10.10.10.10"
          ttl: 1
          proxied: true
          token: ${{ secrets.CLOUDFLARE_TOKEN }}
          zone: ${{ secrets.CLOUDFLARE_ZONE }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
