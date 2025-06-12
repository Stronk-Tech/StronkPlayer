/*

  Returns info on load balanced nodes and retrieving info on where streams are active

*/
const baseUri = "https://loadbalancer.stronk.rocks";

const useLoadBalancer = (props) => {
  const getNode = async () => {
    let nodeResp = await fetch(
      baseUri + "/" + encodeURIComponent(props.streamName),
      {
        method: "GET",
      }
    );
    if (nodeResp.ok) {
      let nodeData = await nodeResp.text();
      if (nodeData == "FULL") {
        return "";
      }
      return nodeData;
    }
  };

  const getSource = async () => {
    let sourceResp = await fetch(
      baseUri + "/?source=" + encodeURIComponent(props.streamName),
      {
        method: "GET",
      }
    );
    if (sourceResp.ok) {
      let sourceData = await sourceResp.text();
      if (sourceData == "FULL") {
        return "";
      } else {
        return sourceData;
      }
    }
  };

  const getBalancer = async () => {
    let balancerResp = await fetch(baseUri, {
      method: "GET",
    });
    if (balancerResp.ok) {
      return await balancerResp.json();
    }
  };

  return [getNode, getSource, getBalancer];
};

export default useLoadBalancer;