const { gql } = require('apollo-server');

module.exports = gql`
  type Applicant {
    username: String!
    resume: String!
    submittedAt: String!
    originalFile: String!
  }
  type JobPost {
    id: ID!
    body: String!
    company: String!
    salary: String!
    title: String!
    location: String!
    username: String!
    createdAt: String!
    applicants: [Applicant]
  }

  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
    profileUrl: String!
    firstName: String!
    lastName: String!
    biography: String!
  }
  input RegisterInput {
    firstName: String!
    lastName: String!
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  type Query {
    getProfile(userId: ID!): User
    searchJobPosts(search: String): [JobPost]
    getJobPosts: [JobPost]
    getJobPostsBy(username: String!): [JobPost]
    getJobPost(postId: ID!): JobPost
  }
  type Mutation {
    changeProfileUrl(userId: ID!, profileUrl: String!): String!
    changeProfile(
      userId: ID!
      firstName: String!
      lastName: String!
      biography: String!
    ): String!
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    createJobPost(
      body: String!
      company: String!
      salary: String!
      title: String!
      location: String!
    ): JobPost!
    deleteJobPost(postId: ID!): String!
    addApplicant(postId: ID!, resume: String!, originalFile: String!): String!
  }
`;