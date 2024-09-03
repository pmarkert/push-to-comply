import { Octokit } from "@octokit/rest";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
const MyOctokit = Octokit.plugin(restEndpointMethods);

function cacheKey(github) {
  if (!github.owner) {
    throw new Error("Missing owner in github context");
  }
  if (!github.repo) {
    throw new Error("Missing repo in github context");
  }
  return `${github.owner}/${github.repo}`;
}

class GitHubIssuesAdapter {
  constructor(context) {
    this.milestones = {};
    this.octokit = new MyOctokit({
      auth: process.env.GITHUB_TOKEN,
    });
    this.context = context;
    this.issue_label = this.context.config.issue_label;
  }

  getMilestone = async function ({ owner, repo, milestone: title }) {
    const request = { owner, repo, title };
    const repo_key = cacheKey(request);
    if (!this.milestones[repo_key]) {
      console.log("Fetching milestones");
      this.milestones[repo_key] = await this.octokit
        .paginate(this.octokit.rest.issues.listMilestones, request)
        .then((milestones) =>
          Object.fromEntries(milestones.map((m) => [m.title, m]))
        );
    }
    return this.milestones[repo_key][title];
  };

  createMilestone = async function ({ owner, repo, milestone: title }) {
    const request = { owner, repo, title };
    const repo_key = cacheKey(request);
    console.log("Creating milestone", request);
    return process.env.DRY_RUN
      ? 0
      : this.octokit.rest.issues
          .createMilestone(request)
          .then(
            (response) => (this.milestones[repo_key][title] = response.data)
          );
  };

  getOrCreateMilestone = async function (github) {
    return (
      github.milestone &&
      ((await this.getMilestone(github)) ??
        (await this.createMilestone(github)))
    );
  };

  // Generate and assign a ticket for the specific procedure
  generateTicket = async function (procedure) {
    const { github, id, name, body, title } = procedure;
    const request = {
      title: title ?? github.title ?? name ?? id,
      labels: [github.labels ?? [], this.issue_label, id].flat(3),
      assignees: (github.assignees ?? []).flat(3),
      milestone: (await this.getOrCreateMilestone(github))?.number,
      body,
      repo: github.repo,
      owner: github.owner,
    };
    console.log("Creating issue", request);
    return process.env.DRY_RUN || this.octokit.rest.issues.create(request);
  };

  procedureLastExecuted = async function (procedure) {
    // Use the date of the most recently created ticket or the template's creation date
    return this.octokit.rest.issues
      .listForRepo({
        repo: procedure.github.repo,
        owner: procedure.github.owner,
        labels: [procedure.id, this.issue_label].join(","),
        state: "all",
        per_page: 1,
        sort: "created",
        direction: "desc",
      })
      .then((issues) =>
        issues.data.length ? null : new Date(issues.data[0].created_at)
      );
  };
}

export default GitHubIssuesAdapter;
