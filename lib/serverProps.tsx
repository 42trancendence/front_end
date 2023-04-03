import { GetServerSideProps } from "next";

const getServerSideProps: GetServerSideProps = async (context) => {
	const authHeader = context.req.headers.authorization;
	if (authHeader) {
		const token = authHeader.split(" ")[1];
		return {
			props: {
				token,
			},
		};
	}
  return {
    props: {
      token: "",
    },
  };
};

export default getServerSideProps;
