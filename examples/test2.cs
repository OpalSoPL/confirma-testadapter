using Confirma.Attributes;
using Confirma.Extensions;

[TestClass]
public class Test2 {

    [TestCase]
    public static void testCase23 () {
        1.ConfirmEqual(1);
    }

    [TestCase]
    public static void testCase231 () {
        2.ConfirmEqual(2);
    }
}