/**
 * Create CloudFlare DNS Record Action for GitHub
 * https://github.com/marketplace/actions/cloudflare-create-dns-record
 */

const fs = require("fs");
const cp = require("child_process");

const CF_API_BASE_URL = "https://api.cloudflare.com/client/v4";

const setOutput = (name, value) => {
  if (process.env.GITHUB_ACTIONS) {
    const outputPath = process.env.GITHUB_OUTPUT;
    if (outputPath) {
      fs.appendFileSync(outputPath, `${name}=${value}\n`);
    } else {
      console.log(`::set-output name=${name}::${value}`);
    }
  }
}

const getCurrentRecordId = () => {
  //https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    `${CF_API_BASE_URL}/zones/${process.env.INPUT_ZONE}/dns_records`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }
  console.log(result);

  const name = process.env.INPUT_NAME.toLowerCase();
  const record = result.find((x) => x.name.toLowerCase() === name);

  if (!record) {
    return null
  }

  return record.id;
};

const createRecord = () => {
  // https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--request", "POST"],
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    ...["--silent", "--data"],
    JSON.stringify({
      type: process.env.INPUT_TYPE,
      name: process.env.INPUT_NAME.toLowerCase(),
      content: process.env.INPUT_CONTENT,
      ttl: Number(process.env.INPUT_TTL),
      proxied: process.env.INPUT_PROXIED == "true",
    }),
    `${CF_API_BASE_URL}/zones/${process.env.INPUT_ZONE}/dns_records`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.dir(errors[0]);
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  setOutput('id', result.id);
  setOutput('name', result.name);
};

const updateRecord = (id) => {
  console.log(`Record exists with ${id}, updating...`);
  // https://api.cloudflare.com/#dns-records-for-a-zone-update-dns-record
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--request", "PUT"],
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    ...["--silent", "--data"],
    JSON.stringify({
      type: process.env.INPUT_TYPE,
      name: process.env.INPUT_NAME,
      content: process.env.INPUT_CONTENT,
      ttl: Number(process.env.INPUT_TTL),
      proxied: process.env.INPUT_PROXIED == "true",
    }),
    `${CF_API_BASE_URL}/zones/${process.env.INPUT_ZONE}/dns_records/${id}`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.dir(errors[0]);
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  setOutput('record_id', result.id);
  setOutput('name', result.name);
}

const id = getCurrentRecordId();
if (id) {
  updateRecord(id);
} else {
  createRecord();
}
