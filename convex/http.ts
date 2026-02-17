import { httpRouter } from "convex/server";
import { auth } from "./auth";
import {
  listSteps,
  readStep,
  updateStep,
  readReport,
  updateReport,
  addCitation,
  addRecommendation,
  proposeHeadlines,
} from "./toolRoutes";

const http = httpRouter();

// Convex Auth HTTP routes
auth.addHttpRoutes(http);

// Tool endpoints for Subconscious function tools
http.route({ path: "/tools/list-steps", method: "POST", handler: listSteps });
http.route({ path: "/tools/read-step", method: "POST", handler: readStep });
http.route({
  path: "/tools/update-step",
  method: "POST",
  handler: updateStep,
});
http.route({
  path: "/tools/read-report",
  method: "POST",
  handler: readReport,
});
http.route({
  path: "/tools/update-report",
  method: "POST",
  handler: updateReport,
});

http.route({
  path: "/tools/add-citation",
  method: "POST",
  handler: addCitation,
});

http.route({
  path: "/tools/add-recommendation",
  method: "POST",
  handler: addRecommendation,
});

http.route({
  path: "/tools/propose-headlines",
  method: "POST",
  handler: proposeHeadlines,
});

export default http;
