using Confirma.Attributes;
using Confirma.Extensions;

[TestClass]
public class Test1 {

    [TestCase]
    public static void testCase2 () {
        1.ConfirmEqual(1);
    }
}