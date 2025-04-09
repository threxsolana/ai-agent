import {GetServerSideProps} from "next";
import {randomUUID} from "crypto";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: `/chat?id=${randomUUID()}&type=new-chat`,
      permanent: false,
    },
  };
};

const Home = () => null;
export default Home;
